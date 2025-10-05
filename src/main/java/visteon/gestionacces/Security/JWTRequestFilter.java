package visteon.gestionacces.Security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import visteon.gestionacces.ServicesImpl.JWTTokenService;
import visteon.gestionacces.ServicesImpl.UserService;

import java.io.IOException;

public class JWTRequestFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JWTRequestFilter.class);

    private final JWTTokenService jwtTokenService;
    private final UserService userDetailsService;

    public JWTRequestFilter(JWTTokenService jwtTokenService, UserService userDetailsService) {
        this.jwtTokenService = jwtTokenService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);

            try {
                username = jwtTokenService.extractUsername(jwt);
            } catch (ExpiredJwtException e) {
                logger.warn("JWT token has expired for request: {} {}",
                        request.getMethod(), request.getRequestURI());
                handleExpiredToken(response);
                return;
            } catch (MalformedJwtException e) {
                logger.error("Invalid JWT token format: {}", e.getMessage());
                handleInvalidToken(response, "Invalid token format");
                return;
            } catch (SignatureException e) {
                logger.error("JWT signature validation failed: {}", e.getMessage());
                handleInvalidToken(response, "Invalid token signature");
                return;
            } catch (Exception e) {
                logger.error("Error processing JWT token: {}", e.getMessage());
                handleInvalidToken(response, "Token processing error");
                return;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                if (jwtTokenService.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("User {} authenticated successfully", username);
                }
            } catch (Exception e) {
                logger.error("Error during user authentication: {}", e.getMessage());
            }
        }

        chain.doFilter(request, response);
    }

    private void handleExpiredToken(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                "{\"error\":\"Token Expired\"," +
                        "\"message\":\"Your session has expired. Please login again.\"," +
                        "\"code\":\"TOKEN_EXPIRED\"}"
        );
    }

    private void handleInvalidToken(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                "{\"error\":\"Invalid Token\"," +
                        "\"message\":\"" + message + "\"," +
                        "\"code\":\"INVALID_TOKEN\"}"
        );
    }
}