SELECT
  `u`.`idUsuario` AS `idUsuario`,
  `u`.`nomeUsuario` AS `nomeUsuario`,
  `c`.`idCurso` AS `idCurso`,
  `c`.`nomeCurso` AS `nomeCurso`
FROM
  (
    (
      (
        `grade_horario_apresentacao`.`usuario` `u`
        JOIN `grade_horario_apresentacao`.`professor` `p` ON((`u`.`idUsuario` = `p`.`idUsuario`))
      )
      JOIN `grade_horario_apresentacao`.`professor_curso` `pc` ON((`p`.`idProfessor` = `pc`.`idProfessor`))
    )
    JOIN `grade_horario_apresentacao`.`curso` `c` ON((`pc`.`idCurso` = `c`.`idCurso`))
  )